module.exports = {
    foobar: {
        required: true,
        type: 'String',
        default: 'Hello World!',
        allowed: [
            'Hello',
            'World',
            'Hello World'
        ]
    },
    foo: {
        bar: {
            required: true,
            type: 'String',
        },
        test: {
            required: false,
            type: 'Number',
            static: true
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