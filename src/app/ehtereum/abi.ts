import { AbiItem } from 'web3-utils';

export const UTOPIA_ABI: AbiItem[] = [
    {
        inputs: [],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'previousAdminRole',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'newAdminRole',
                type: 'bytes32',
            },
        ],
        name: 'RoleAdminChanged',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
        ],
        name: 'RoleGranted',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'sender',
                type: 'address',
            },
        ],
        name: 'RoleRevoked',
        type: 'event',
    },
    {
        inputs: [],
        name: 'ADMIN_ROLE',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'DAOWallet',
        outputs: [
            {
                internalType: 'address payable',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'DEFAULT_ADMIN_ROLE',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'landId',
                type: 'uint256',
            },
        ],
        name: 'NFTToLand',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'NFT_ROLE',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'int256',
                name: 'x',
                type: 'int256',
            },
        ],
        name: 'abs',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'int256',
                name: 'x1',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'x2',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'y1',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'y2',
                type: 'int256',
            },
            {
                internalType: 'address',
                name: 'addr',
                type: 'address',
            },
            {
                internalType: 'string',
                name: 'hash',
                type: 'string',
            },
        ],
        name: 'adminAssignLand',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address payable',
                name: '_DAOWallet',
                type: 'address',
            },
        ],
        name: 'adminSetDAOWallet',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bool',
                name: 'val',
                type: 'bool',
            },
        ],
        name: 'adminSetIsPublic',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'addr',
                type: 'address',
            },
        ],
        name: 'adminSetNFTContract',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'price',
                type: 'uint256',
            },
        ],
        name: 'adminSetUnitLandPrice',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'allowPublicAssign',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'int256',
                name: 'x1',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'x2',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'y1',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'y2',
                type: 'int256',
            },
            {
                internalType: 'string',
                name: 'hash',
                type: 'string',
            },
        ],
        name: 'assignLand',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
        ],
        name: 'getLands',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'id',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'x1',
                        type: 'int256',
                    },
                    {
                        internalType: 'int256',
                        name: 'x2',
                        type: 'int256',
                    },
                    {
                        internalType: 'int256',
                        name: 'y1',
                        type: 'int256',
                    },
                    {
                        internalType: 'int256',
                        name: 'y2',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'time',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'hash',
                        type: 'string',
                    },
                    {
                        internalType: 'bool',
                        name: 'isNFT',
                        type: 'bool',
                    },
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'ownerIndex',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct Utopia.Land[]',
                name: '_lands',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256[]',
                name: 'ids',
                type: 'uint256[]',
            },
        ],
        name: 'getLandsByIds',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'id',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'x1',
                        type: 'int256',
                    },
                    {
                        internalType: 'int256',
                        name: 'x2',
                        type: 'int256',
                    },
                    {
                        internalType: 'int256',
                        name: 'y1',
                        type: 'int256',
                    },
                    {
                        internalType: 'int256',
                        name: 'y2',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'time',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'hash',
                        type: 'string',
                    },
                    {
                        internalType: 'bool',
                        name: 'isNFT',
                        type: 'bool',
                    },
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'ownerIndex',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct Utopia.Land[]',
                name: '_lands',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
        ],
        name: 'getRoleAdmin',
        outputs: [
            {
                internalType: 'bytes32',
                name: '',
                type: 'bytes32',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'grantRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'hasRole',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'int256',
                name: 'x1',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'x2',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'y1',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'y2',
                type: 'int256',
            },
        ],
        name: 'landPrice',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'landId',
                type: 'uint256',
            },
        ],
        name: 'landToNFT',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'lands',
        outputs: [
            {
                internalType: 'uint256',
                name: 'id',
                type: 'uint256',
            },
            {
                internalType: 'int256',
                name: 'x1',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'x2',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'y1',
                type: 'int256',
            },
            {
                internalType: 'int256',
                name: 'y2',
                type: 'int256',
            },
            {
                internalType: 'uint256',
                name: 'time',
                type: 'uint256',
            },
            {
                internalType: 'string',
                name: 'hash',
                type: 'string',
            },
            {
                internalType: 'bool',
                name: 'isNFT',
                type: 'bool',
            },
            {
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'ownerIndex',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'lastLandId',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'ownerLands',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'renounceRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes32',
                name: 'role',
                type: 'bytes32',
            },
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
        ],
        name: 'revokeRole',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bytes4',
                name: 'interfaceId',
                type: 'bytes4',
            },
        ],
        name: 'supportsInterface',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'landId',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: '_to',
                type: 'address',
            },
        ],
        name: 'transferLand',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'landId',
                type: 'uint256',
            },
            {
                internalType: 'address',
                name: '_to',
                type: 'address',
            },
        ],
        name: 'transferNFTLand',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'unitLandPrice',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'hash',
                type: 'string',
            },
            {
                internalType: 'uint256',
                name: 'landId',
                type: 'uint256',
            },
        ],
        name: 'updateLand',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];
