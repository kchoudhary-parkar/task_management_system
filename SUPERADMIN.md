# Super Admin Account

## Default Super Admin Credentials

A hardcoded super-admin account is automatically created when the server starts.

**Email:** `superadmin@gmail.com`  
**Password:** `superadmin`

### Important Notes:

1. ✅ This account is created automatically on server startup
2. ✅ The account will be the only super-admin by default
3. ✅ You can use these credentials to log in and manage the system
4. ⚠️  **Security Warning**: This is a development/demo setup. In production, you should:
   - Change the password immediately after first login
   - Use environment variables for credentials
   - Implement password change functionality
   - Consider removing hardcoded credentials

### Role Hierarchy:

- **Super Admin** (superadmin@gmail.com)
  - Full system access
  - Can promote members to admin
  - Can demote admins to member
  - Cannot be modified by other users

- **Admin** (promoted by super-admin)
  - Can create projects
  - Can view all users
  - Can manage projects and teams
  - Cannot manage user roles

- **Member** (default for all registrations)
  - Can work on assigned tasks
  - Can view projects they're part of
  - Cannot create projects
  - Cannot view user management

### Future Enhancements:

- Multiple super-admins can be added by promoting existing admins (feature not yet implemented)
- Password change functionality can be added
- Two-factor authentication for super-admin accounts
