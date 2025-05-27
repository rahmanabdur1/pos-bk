import UserRole from '../models/userRole.model.js';

// Create a new role
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions, createdBy } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required.' });
    }

    const newRole = new UserRole({
      name,
      description,
      permissions,
      createdBy,
      createdAt: new Date()
    });

    await newRole.save();

    res.status(201).json({
      message: 'UserRole created successfully',
      data: newRole
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create user role',
      error: error.message
    });
  }
};

// Get filtered & paginated role list
export const getUserRoleList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      createDateFrom,
      createDateTo,
      createBy,
      authorizeDateFrom,
      authorizeDateTo,
      authorizeBy,
      updateDateFrom,
      updateDateTo,
      updateBy,
      authorized,
      status
    } = req.query;

    const filter = {};

    if (createDateFrom || createDateTo) {
      filter.createdAt = {};
      if (createDateFrom) filter.createdAt.$gte = new Date(createDateFrom);
      if (createDateTo) filter.createdAt.$lte = new Date(createDateTo);
    }

    if (createBy) filter.createdBy = createBy;

    if (authorizeDateFrom || authorizeDateTo) {
      filter.authorizedAt = {};
      if (authorizeDateFrom) filter.authorizedAt.$gte = new Date(authorizeDateFrom);
      if (authorizeDateTo) filter.authorizedAt.$lte = new Date(authorizeDateTo);
    }

    if (authorizeBy) filter.authorizedBy = authorizeBy;

    if (updateDateFrom || updateDateTo) {
      filter.updatedAt = {};
      if (updateDateFrom) filter.updatedAt.$gte = new Date(updateDateFrom);
      if (updateDateTo) filter.updatedAt.$lte = new Date(updateDateTo);
    }

    if (updateBy) filter.updatedBy = updateBy;

    if (authorized) filter.authorized = authorized;

    if (status) filter.status = status;

    const roles = await UserRole.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Add count of permissions for each role
    const data = roles.map(role => ({
      id: role._id,
      name: role.name,
      description: role.description,
      count: role.permissions.length,
      createdAt: role.createdAt,
      createdBy: role.createdBy,
      authorizedAt: role.authorizedAt,
      authorizedBy: role.authorizedBy,
      updatedAt: role.updatedAt,
      updatedBy: role.updatedBy,
      authorized: role.authorized,
      status: role.status
    }));

    const total = await UserRole.countDocuments(filter);

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch user roles',
      error: error.message
    });
  }
};

// Edit a role by ID
export const editRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, updatedBy, authorized, authorizedBy, authorizedAt, status } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required.' });
    }

    const role = await UserRole.findById(id);
    if (!role) return res.status(404).json({ message: 'UserRole not found.' });

    role.name = name;
    role.description = description;
    if (permissions) role.permissions = permissions;
    if (updatedBy) role.updatedBy = updatedBy;
    role.updatedAt = new Date();
    if (authorized) role.authorized = authorized;
    if (authorizedBy) role.authorizedBy = authorizedBy;
    if (authorizedAt) role.authorizedAt = authorizedAt;
    if (status) role.status = status;

    await role.save();

    res.status(200).json({ message: 'UserRole updated successfully', data: role });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
};

// Delete a role by ID
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await UserRole.findById(id);
    if (!role) return res.status(404).json({ message: 'UserRole not found.' });

    await role.remove();

    res.status(200).json({ message: 'UserRole deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user role', error: error.message });
  }
};
