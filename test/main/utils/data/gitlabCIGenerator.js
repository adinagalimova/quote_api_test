const fs = require('fs');
const path = require('path');
const YAML = require('js-yaml');

const specDirectory = path.join(__dirname, '..', '..', '..', 'tests', 'specs');

const specFiles = fs.readdirSync(specDirectory);
const jobs = specFiles.map((spec, index) => ({
  [`API tests ${index + 1}`]: {
    image: `node:${process.version.replace(/^v+/, '')}`,
    stage: 'test',
    variables: {
      SPEC_PATTERN: index + 1,
    },
    only: [
      'dev',
    ],
    tags: [
      'k8s',
    ],
    before_script: [
      // eslint-disable-next-line no-template-curly-in-string
      'echo "${ENV_TEST}" | tr -d "\r" > ./.env.test',
      'apt-get update && apt-get install -y default-jre',
      'npm install',
    ],
    script: [
      'npm run lint',
      'npm run test:split',
    ],
    artifacts: {
      when: 'always',
      expire_in: '1 month',
      paths: [
        'test/artifacts',
        'test/resources/data/configData.json',
      ],
    },
  },
}));

const gitlabCIConfig = {
  ...Object.assign({}, ...jobs),
};

fs.writeFileSync(
  path.join(__dirname, '..', '..', '..', '..', '.split-config.yml'),
  YAML.dump(gitlabCIConfig),
);
