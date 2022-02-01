const pause = ms => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

async function main(argv) {
  const [, , fail = 'false', timeout = 10] = argv;
  console.log(`waiting for ${ timeout }ms...`);
  console.log();
  await pause(timeout);

  if (fail === 'true') {
    console.error('fail');
    process.exit(1);
  }
  console.log('success');
}

main(process.argv);
