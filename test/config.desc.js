module.exports = {
    foobar: {
        required: true,
        type: 'string',
        default: "Hello World!",
        allowed: false
    },
    foo: {
        bar: {
            required: true,
            type: 'string',
            default: 'awd'
        },
        test: {
            required: false,
            type: 'number',
            static: true,
            default: 0
        }
    },
    this: {
        required: false,
        default: 'this',
        is: {
            required: true,
            default: 'SPARTA!'
        }
    }
}