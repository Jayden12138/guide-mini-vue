const { effect } = require('vue');

let foo = 10;
const runner = effect(() => {
  foo++;
  return 'foo';
});

console.log(foo); // 11
const r = runner(); 
console.log(foo); // 12
console.log(r); // 'foo'
