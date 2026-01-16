import { 
  signInWithEmailAndPassword, 
  signOut,
  type User
} from 'firebase/auth'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  getDoc,
  limit
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

// Types
export interface AdminUser {
  uid: string
  email: string
  role: 'admin' | 'superadmin'
  lastLogin: string
}

export interface AuditLog {
  id?: string
  action: string
  details: string
  performedBy: string
  timestamp: string
}

const ADMIN_COLLECTION = 'users' // Assuming roles are stored in users collection
const AUDIT_COLLECTION = 'audit_logs'

/**
 * Service to handle all admin-related operations.
 * Acts as a secure interface to the backend.
 */
export const adminService = {
  /**
   * Helper to ensure Firebase is initialized
   */
  checkConfig() {
    if (!auth || !db) {
      throw new Error('Firebase is not configured. Please check your .env file.')
    }
  },

  /**
   * Authenticate admin user
   * Note: Password hashing is handled securely by Firebase Auth (bcrypt)
   */
  async login(email: string, password: string): Promise<User> {
    this.checkConfig()
    
    // Create a timeout promise that rejects after 15 seconds
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Login request timed out. Please check your network connection.')), 15000)
    })

    // The actual login logic
    const loginPromise = async (): Promise<User> => {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      
      // Normalize emails for comparison
      const normalizedEmail = cred.user.email?.toLowerCase() || ''
      // Hardcoded check for master admin (avoids DB dependency for main admin)
      const isMasterAdmin = normalizedEmail === 'genibimentalhealth13@gmail.com'

      if (!isMasterAdmin) {
        // Check if user has admin role in DB
        const userDoc = await getDoc(doc(db, ADMIN_COLLECTION, cred.user.uid))
        if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
          await signOut(auth)
          throw new Error('Unauthorized: User is not an admin')
        }
      }
      
      // Log login action
      await this.logAudit('LOGIN', `Admin logged in: ${email}`, cred.user.uid)
      
      // Update last login
      await updateDoc(doc(db, ADMIN_COLLECTION, cred.user.uid), {
        lastLogin: new Date().toISOString()
      }).catch(() => {
        // Ignore update error if doc doesn't exist (master admin might not be in DB yet)
      })
      
      return cred.user
    }

    // Race between login logic and timeout
    return Promise.race([loginPromise(), timeoutPromise])
  },

  async logout() {
    if (!auth) return
    await signOut(auth)
  },

  /**
   * Log administrative actions for security auditing
   */
  async logAudit(action: string, details: string, userId?: string) {
    if (!auth || !db) return
    try {
      const currentUser = auth.currentUser
      await addDoc(collection(db, AUDIT_COLLECTION), {
        action,
        details,
        performedBy: userId || currentUser?.email || 'system',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to write audit log', error)
      // We don't throw here to avoid blocking the main action, but in high security apps we might.
    }
  },

  /**
   * Fetch recent audit logs
   */
  async getAuditLogs(limitCount = 100): Promise<AuditLog[]> {
    const q = query(
      collection(db, AUDIT_COLLECTION), 
      orderBy('timestamp', 'desc'), 
      limit(limitCount)
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog))
  },

  /**
   * Fetch all registered users
   */
  async getUsers() {
    const snap = await getDocs(collection(db, 'users'))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  /**
   * Promote a user to admin
   */
  async promoteToAdmin(targetUserId: string, targetEmail: string) {
    await updateDoc(doc(db, ADMIN_COLLECTION, targetUserId), {
      role: 'admin'
    })
    await this.logAudit('PROMOTE_ADMIN', `Promoted user ${targetEmail} to admin`)
  },
  
  /**
   * Remove admin privileges
   */
  async removeAdmin(targetUserId: string, targetEmail: string) {
    await updateDoc(doc(db, ADMIN_COLLECTION, targetUserId), {
      role: 'user'
    })
    await this.logAudit('DEMOTE_ADMIN', `Removed admin rights from ${targetEmail}`)
  },

  /**
   * Assign medication to a user
   */
  async assignMedication(data: {
    userId: string
    name: string
    dosage: string
    frequency: string
    instructions: string
  }) {
    await addDoc(collection(db, 'medications'), {
      ...data,
      assignedBy: auth.currentUser?.email || 'admin',
      assignedAt: new Date().toISOString()
    })
    await this.logAudit('ASSIGN_MED', `Assigned ${data.name} to user ${data.userId}`)
  }
}
