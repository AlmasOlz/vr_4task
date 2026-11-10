const Service = require('@vue/cli-service');
const service = new Service(process.cwd());
service.run('build').then(() => process.exit(0)).catch(error => {
  console.error(error); process.exit(1);
});
