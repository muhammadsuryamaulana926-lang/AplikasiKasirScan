export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  SignUpPassword: { email: string };
  VerificationCode: { email: string; type?: 'signup' | 'forgot' };
  ForgotPassword: undefined;
  ResetPassword: { email: string; code?: string };
  Home: undefined;
  Welcome: undefined;
  Chat: { actionTitle?: string } | undefined;
  AccountSettings: undefined;
};
