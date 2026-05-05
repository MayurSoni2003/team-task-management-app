const { z } = require('zod');

// Auth Schemas
const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Project Schemas
const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
  }),
});

// Task Schemas
const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required'),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    dueDate: z.string().datetime().optional().or(z.date().optional()),
    projectId: z.string().uuid('Valid Project ID is required'),
    assignedTo: z.string().uuid('Valid assignedTo UUID is required'),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().datetime().optional().or(z.date().optional()),
    assignedTo: z.string().uuid().optional(),
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  createProjectSchema,
  createTaskSchema,
  updateTaskSchema,
};
