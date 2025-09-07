const awsconfig = {
  Auth: {
    region: "eu-central-1",
    userPoolId: "eu-central-1_AMYk3yeax",
    userPoolWebClientId: "5j0s0156ot9qjbk42dhbo2fb7l",
  },
  API: {
    endpoints: [
      {
        name: "PatientsAPI",
        endpoint: "https://880f0qm8f8.execute-api.eu-central-1.amazonaws.com/prod/",
        region: "eu-central-1",
      },
    ],
  },
};

export default awsconfig;
