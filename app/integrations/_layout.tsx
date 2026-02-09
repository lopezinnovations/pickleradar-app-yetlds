
import { Stack } from 'expo-router';

// This layout prevents the integrations folder from being treated as a route
export default function IntegrationsLayout() {
  return null;
}

export const unstable_settings = {
  initialRouteName: undefined,
};
