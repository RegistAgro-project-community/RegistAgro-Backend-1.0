export const roles = {
    consumer: {
        consumer: [
            "create", "read", "update", "delete"
        ],
        farm: [
            "read"
        ],
        carrier: [
            "no-permission"
        ]
    },
    carrier: {
        carrier: [
            "create", "read", "update", "delete"
        ],
        consumer: [
            "no-permission"
        ],
        farm: [
            "read"
        ]
    },
    farm:{
        farm: [
            "create", "read", "update", "delete"
        ],
        consumer: [
            "read"
        ],
        carrier: [
            "no-permission"
        ]
    }
}
