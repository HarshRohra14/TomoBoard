// Offline authentication service for demo purposes
const DEMO_USERS = [
  {
    id: 'demo-user-1',
    email: 'demo@tomoboard.com',
    username: 'demo_user',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    avatar: null,
    isActive: true
  },
  {
    id: 'admin-user-1', 
    email: 'admin@tomoboard.com',
    username: 'admin',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    avatar: null,
    isActive: true
  }
];

export const offlineAuth = {
  login: async (email, password) => {
    console.log('Offline login attempt:', email);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = DEMO_USERS.find(u => u.email === email && u.isActive);
    
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      data: {
        message: 'Login successful (offline mode)',
        user: userWithoutPassword,
        tokens: {
          accessToken: `offline_token_${user.id}_${Date.now()}`,
          refreshToken: `offline_refresh_${user.id}_${Date.now()}`
        }
      }
    };
  },
  
  signup: async (userData) => {
    console.log('Offline signup attempt:', userData.email);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUser = DEMO_USERS.find(u => 
      u.email === userData.email || u.username === userData.username
    );
    
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: `offline_user_${Date.now()}`,
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: null,
      isActive: true
    };
    
    // Add to demo users (for this session only)
    DEMO_USERS.push({ ...newUser, password: userData.password });
    
    return {
      data: {
        message: 'User created successfully (offline mode)',
        user: newUser,
        tokens: {
          accessToken: `offline_token_${newUser.id}_${Date.now()}`,
          refreshToken: `offline_refresh_${newUser.id}_${Date.now()}`
        }
      }
    };
  },
  
  me: async (token) => {
    console.log('Offline me request:', token);
    
    if (!token || !token.startsWith('offline_token_')) {
      throw new Error('Invalid token');
    }
    
    const userId = token.split('_')[2];
    const user = DEMO_USERS.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      data: {
        user: userWithoutPassword
      }
    };
  }
};
