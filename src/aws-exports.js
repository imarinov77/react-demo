const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: "eu-central-1_AMYk3yeax",
      userPoolClientId: "5j0s0156ot9qjbk42dhbo2fb7l",
      loginWith: { email: true },
    },
  },
  API: {
    // Provide endpoints at the root for Amplify API name lookup
    endpoints: [
      {
        name: "PatientsAPI",
        endpoint: "https://880f0qm8f8.execute-api.eu-central-1.amazonaws.com/prod",
        region: "eu-central-1",
      },
    ],
    // Keep REST nesting as well (harmless), but name lookup relies on the root array
    REST: {
      endpoints: [
        {
          name: "PatientsAPI",
          endpoint: "https://880f0qm8f8.execute-api.eu-central-1.amazonaws.com/prod",
          region: "eu-central-1",
        },
      ],
    },
  },
};

export default awsconfig;
