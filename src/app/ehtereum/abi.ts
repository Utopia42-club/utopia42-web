import { AbiItem } from "web3-utils"

export const UTOPIA_ABI: AbiItem[] = [{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": true, "inputs": [{ "internalType": "int256", "name": "x", "type": "int256" }], "name": "abs", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "addr", "type": "address" }], "name": "addAdmin", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "int256", "name": "x1", "type": "int256" }, { "internalType": "int256", "name": "y1", "type": "int256" }, { "internalType": "int256", "name": "x2", "type": "int256" }, { "internalType": "int256", "name": "y2", "type": "int256" }, { "internalType": "address", "name": "addr", "type": "address" }], "name": "adminAssignLand", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address payable", "name": "_fundsWallet", "type": "address" }], "name": "adminSetFundsWallet", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bool", "name": "val", "type": "bool" }], "name": "adminSetIsPublic", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "price", "type": "uint256" }], "name": "adminSetUnitLandPrice", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "admins", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "adminsMap", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "allowPublicAssign", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "int256", "name": "x1", "type": "int256" }, { "internalType": "int256", "name": "y1", "type": "int256" }, { "internalType": "int256", "name": "x2", "type": "int256" }, { "internalType": "int256", "name": "y2", "type": "int256" }, { "internalType": "string", "name": "hash", "type": "string" }], "name": "assignLand", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "fundsWallet", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "getLand", "outputs": [{ "internalType": "int256", "name": "x1", "type": "int256" }, { "internalType": "int256", "name": "y1", "type": "int256" }, { "internalType": "int256", "name": "x2", "type": "int256" }, { "internalType": "int256", "name": "y2", "type": "int256" }, { "internalType": "uint256", "name": "time", "type": "uint256" }, { "internalType": "string", "name": "hash", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "getLands", "outputs": [{ "components": [{ "internalType": "int256", "name": "x1", "type": "int256" }, { "internalType": "int256", "name": "x2", "type": "int256" }, { "internalType": "int256", "name": "y1", "type": "int256" }, { "internalType": "int256", "name": "y2", "type": "int256" }, { "internalType": "uint256", "name": "time", "type": "uint256" }, { "internalType": "string", "name": "hash", "type": "string" }], "internalType": "struct Utopia.Land[]", "name": "", "type": "tuple[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwners", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "int256", "name": "x1", "type": "int256" }, { "internalType": "int256", "name": "y1", "type": "int256" }, { "internalType": "int256", "name": "x2", "type": "int256" }, { "internalType": "int256", "name": "y2", "type": "int256" }], "name": "landPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "lands", "outputs": [{ "internalType": "int256", "name": "x1", "type": "int256" }, { "internalType": "int256", "name": "x2", "type": "int256" }, { "internalType": "int256", "name": "y1", "type": "int256" }, { "internalType": "int256", "name": "y2", "type": "int256" }, { "internalType": "uint256", "name": "time", "type": "uint256" }, { "internalType": "string", "name": "hash", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "owners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }, { "internalType": "address", "name": "_to", "type": "address" }], "name": "transferLand", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "unitLandPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "string", "name": "hash", "type": "string" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "updateLand", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }]