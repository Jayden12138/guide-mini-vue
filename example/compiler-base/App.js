

export const App = {
    name: 'App',
    template: `<div>hi, {{ msg }}</div>`,
    setup() {
        return {
            msg: 'hello world'
        }
    }
}