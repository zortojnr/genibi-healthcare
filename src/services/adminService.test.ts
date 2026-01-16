import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminService } from './adminService'
import * as firebaseAuth from 'firebase/auth'
import * as firebaseFirestore from 'firebase/firestore'

// Mock Firebase modules
vi.mock('../lib/firebase', () => ({
  auth: { currentUser: { email: 'admin@test.com', uid: 'admin123' } },
  db: {}
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn()
}))

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully if user is admin', async () => {
      // Setup mocks
      const mockUser = { uid: '123', email: 'admin@test.com' }
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser
      } as any)
      
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'admin' })
      } as any)

      // Execute
      const user = await adminService.login('admin@test.com', 'password')

      // Verify
      expect(user).toEqual(mockUser)
      expect(firebaseFirestore.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ action: 'LOGIN' })
      )
    })

    it('should throw error if user is not admin', async () => {
      // Setup mocks
      const mockUser = { uid: '456', email: 'user@test.com' }
      vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser
      } as any)
      
      vi.mocked(firebaseFirestore.getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'user' }) // Not admin
      } as any)

      // Execute & Verify
      await expect(adminService.login('user@test.com', 'password'))
        .rejects.toThrow('Unauthorized: User is not an admin')
        
      expect(firebaseAuth.signOut).toHaveBeenCalled()
    })
  })

  describe('logAudit', () => {
    it('should write to audit_logs collection', async () => {
      await adminService.logAudit('TEST_ACTION', 'Test details')
      
      expect(firebaseFirestore.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          action: 'TEST_ACTION',
          details: 'Test details',
          performedBy: expect.any(String) // Should use current user email or uid
        })
      )
    })
  })
})
