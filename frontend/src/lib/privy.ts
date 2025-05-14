import { type PrivyClientConfig } from '@privy-io/react-auth';

type PrivyConfig = PrivyClientConfig & {
  appId: string;
};

// Configuration for Privy Auth
export const privyConfig: PrivyConfig = {
  appId: 'cm7ff4ltg029ubyp3c7kgd85m',
  
  loginMethods: ['wallet', 'email', 'google', 'twitter'],
  
  // Appearance customization options
  appearance: {
    theme: 'dark',
    accentColor: '#eab308', 
    logo: 'https://dummyimage.com/100x100/eab308/fff',
  },
  
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
} 