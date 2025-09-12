import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Users as UsersIcon, Plus } from 'lucide-react';
import { adminService, User } from '../../../services/adminService';
import { IOSCard, IOSButton, IOSSectionHeader, IOSPagination, IOSAvatar } from '../../../components/ios/IOSDesignSystem';
import { DashboardSection, DataPanel } from '../layout/DashboardPrimitives';
import { RLSDiagnosticsBanner } from '../../../components/ios/RLSDiagnosticsBanner';
import { cn } from '../../../styles/standardClasses';

export const AdminUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
    <DashboardSection>
      <RLSDiagnosticsBanner 
        hasErrors={hasErrors}
        errorMessage={errorMessage}
        statsLoaded={!loading}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <IOSSectionHeader title="Users Management" subtitle="Manage all registered users" />
        <div className="flex items-center space-x-2">
          <IOSButton onClick={loadUsers} className="flex items-center space-x-2" aria-label="Refresh users list">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </IOSButton>
          <IOSButton variant="primary" className="flex items-center space-x-2" aria-label="Add user">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </IOSButton>
        </div>
      </div>

      <DataPanel padded>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-200" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl transition-colors duration-200',
              'bg-black border border-gray-700 text-white placeholder-ios-text-secondary',
              'focus:ring-2 focus:ring-ios-accent focus:border-pink-500'
            )}
            aria-label="Search users"
          />
        </div>
      </DataPanel>

      <DataPanel>
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-pink-500" />
            <p className="text-gray-200 font-medium">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Users table">
              <thead className={cn('bg-black border-b border-gray-700')}>
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">Joined</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ios-border" role="rowgroup">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-black transition-colors duration-200" role="row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <IOSAvatar user={user} size="medium" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-200">ID: {user.id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">{user.phone || 'Not provided'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-200">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-ios-success/20 text-ios-success border border-ios-success/30">
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
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-200 font-medium">No users found</p>
            <p className="text-gray-200/70 text-sm">Try adjusting your search criteria</p>
          </div>
        )}
        <IOSPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          showItemsPerPageSelector={true}
          onItemsPerPageChange={setItemsPerPage}
        />
      </DataPanel>
    </DashboardSection>
  );
};
