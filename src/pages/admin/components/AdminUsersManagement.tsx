import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Users as UsersIcon, Plus } from 'lucide-react';
import { adminService, User } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSPagination, IOSAvatar } from '../../../components/ios/IOSDesignSystem';
import { DashboardSection, DataPanel } from '../layout/DashboardPrimitives';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { scrollToPaginationContent } from '../../../utils/scrollUtils';
import { cn } from '../../../utils/cn';

export const AdminUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle page change with scroll to admin content
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToPaginationContent();
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setHasErrors(false);
      setErrorMessage('');
      const result = await adminService.getUsers(currentPage, itemsPerPage, searchTerm);
      setUsers(result.data);
      setTotalCount(result.count);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setHasErrors(true);
      setErrorMessage(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const lowered = searchTerm.toLowerCase();
  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(lowered)) ||
    (user.email && user.email.toLowerCase().includes(lowered)) ||
    (user.phone && user.phone.includes(searchTerm))
  );

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  return (
    <div className="space-y-8 min-h-screen">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-black via-gray-950 to-black backdrop-blur-xl border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
              Users Management
            </h1>
            <p className="text-gray-400 mt-1">Manage all registered users and their accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <IOSButton 
              onClick={loadUsers} 
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 border-pink-500/30 hover:from-pink-500/30 hover:to-fuchsia-500/30" 
              disabled={loading}
              aria-label="Refresh users list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </IOSButton>
            <IOSButton 
              variant="primary" 
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30" 
              aria-label="Add user"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </IOSButton>
          </div>
        </div>
      </div>

      {/* Diagnostic Banner */}
      <div className="px-6">
        <RLSDiagnosticsBanner 
          hasErrors={hasErrors}
          errorMessage={errorMessage}
          statsLoaded={!loading}
        />
      </div>

      {/* Modern Search Section */}
      <div className="px-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400/60" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/50 backdrop-blur-sm border border-pink-500/20 text-white placeholder-gray-400 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
              aria-label="Search users"
            />
          </div>
        </div>
      </div>

      {/* Modern Users Table */}
      <div className="px-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500/20 to-fuchsia-500/20 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-pink-400" />
                </div>
                <div className="absolute inset-0 rounded-full bg-pink-500/10 animate-pulse"></div>
              </div>
              <p className="text-white font-medium">Loading users...</p>
              <p className="text-gray-400 text-sm mt-1">Fetching user data from database</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto admin-table-container">
              <table className="admin-table admin-table-sticky zebra compact w-full" role="table" aria-label="Users table">
                <thead>
                  <tr>
                    <th scope="col" className="text-left">User</th>
                    <th scope="col" className="text-left">Phone</th>
                    <th scope="col" className="text-left">Joined</th>
                    <th scope="col" className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group" role="row">
                      <td className="whitespace-nowrap">
                        <div className="flex items-center">
                          <IOSAvatar user={user} size="medium" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white group-hover:text-pink-200 transition-colors duration-300">{user.name}</div>
                            <div className="text-sm text-gray-400">ID: {user.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="text-sm text-white">{user.phone || 'Not provided'}</span>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-200 border border-emerald-500/30">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500/10 to-fuchsia-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-pink-400/60" />
                </div>
                <div className="absolute inset-0 rounded-full bg-pink-500/5 animate-pulse"></div>
              </div>
              <p className="text-white font-medium">No users found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
            </div>
          )}
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-white/10 bg-gradient-to-r from-pink-500/5 to-fuchsia-500/5">
            <IOSPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showItemsPerPageSelector={true}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
