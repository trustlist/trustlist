# trustlist

This is an example application of a [UniRep](https://github.com/Unirep/Unirep) attester. The app attests to user data that becomes a user's reputation score, which helps other users decide who they will engage with.

> See: [Users and Attesters](https://developer.unirep.io/docs/protocol/users-and-attesters)

## 1. Installation

```shell
git clone https://github.com/trustlist/trustlist.git
```

Then `cd` into the directory that was created and install packages

```shell
yarn install
```

## 2. Start each daemon

### 2.1 Build the files

```shell
yarn build
```

### 2.2 Start a node

```shell
yarn contracts hardhat node
```

### 2.3 Deploy smart contracts

in new terminal window, from root:

```shell
yarn contracts deploy
```

### 2.4 Start a relayer (backend)

```shell
yarn relay start
```

### 2.5 Start a frontend

in new terminal window, from root:

```shell
yarn frontend start
```

It will be running at: http://127.0.0.1:3000/

## 3. Linter

### 3.1 Format the code

```shell
yarn lint:fix
```

### 3.2 Check if the code is formatted

```shell
yarn lint:check
```
