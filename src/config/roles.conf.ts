export const roles = {
    admin: {
        consumer: ["create", "read", "update", "delete"],
        carrier: ["create", "read", "update", "delete"],
        farm: ["create", "read", "update", "delete"],
        admin: ["read"],
    },
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
