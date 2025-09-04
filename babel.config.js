module.exports = {
  presets: ['@react-native/babel-preset'], // use this for RN 0.80+
  plugins: [
    'react-native-worklets/plugin', // 👈 only keep this, must be last
  ],
};
