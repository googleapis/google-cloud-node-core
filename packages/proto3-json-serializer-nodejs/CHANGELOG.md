# Changelog

## [4.0.0](https://github.com/googleapis/google-cloud-node-core/compare/proto3-json-serializer-v3.0.2...proto3-json-serializer-v4.0.0) (2025-10-09)


### ⚠ BREAKING CHANGES

* upgrade to node 18 ([#113](https://github.com/googleapis/google-cloud-node-core/issues/113))
* require Node 14 ([#72](https://github.com/googleapis/google-cloud-node-core/issues/72))
* make Node 12 minimum language version ([#38](https://github.com/googleapis/google-cloud-node-core/issues/38))
* proto3 JSON serializer and deserializer ([#2](https://github.com/googleapis/google-cloud-node-core/issues/2))
* monorepo migration

### Features

* Make Node 12 minimum language version ([#38](https://github.com/googleapis/google-cloud-node-core/issues/38)) ([96cf642](https://github.com/googleapis/google-cloud-node-core/commit/96cf6422db2aca4d96052917063eb1c2b999e41f))
* Option to serialize enum values as numbers ([#60](https://github.com/googleapis/google-cloud-node-core/issues/60)) ([1df32ef](https://github.com/googleapis/google-cloud-node-core/commit/1df32ef0018bc255721f0c2ab2f0072a624bc360))
* Proto3 JSON serializer and deserializer ([#2](https://github.com/googleapis/google-cloud-node-core/issues/2)) ([431ba6e](https://github.com/googleapis/google-cloud-node-core/commit/431ba6ef2d3563e7b0258e234f05bf9769dfcccd))
* Remove extends from gts in proto3jsonserializer and define attributes in config ([77df54d](https://github.com/googleapis/google-cloud-node-core/commit/77df54d6d72d839cda0e95939d39109231cb822e))


### Bug Fixes

* Accept and return strings for int64 and uint64 ([#7](https://github.com/googleapis/google-cloud-node-core/issues/7)) ([3fe4fa9](https://github.com/googleapis/google-cloud-node-core/commit/3fe4fa94b23b2d9996f07b2d335bf458910d0f62))
* Change eslintrc.json to .js ([cd3e129](https://github.com/googleapis/google-cloud-node-core/commit/cd3e129045f389bb9dd34e0f76b9647a1e597cd2))
* **deps:** Bump protobuf.js to ^6.11.3 ([#46](https://github.com/googleapis/google-cloud-node-core/issues/46)) ([fb3905a](https://github.com/googleapis/google-cloud-node-core/commit/fb3905ae033302ba69eaf304037997a044e289ed))
* **deps:** Protobufjs is a dependency for the types ([#23](https://github.com/googleapis/google-cloud-node-core/issues/23)) ([a12cee2](https://github.com/googleapis/google-cloud-node-core/commit/a12cee2f00a992cbc142a35c8fa724daa9500555))
* **deps:** Update dependency google-proto-files to v3 ([#53](https://github.com/googleapis/google-cloud-node-core/issues/53)) ([407f111](https://github.com/googleapis/google-cloud-node-core/commit/407f111f7e99e57934f3b44e4e6f3705bc3ba03f))
* **deps:** Update dependency google-proto-files to v4 ([#82](https://github.com/googleapis/google-cloud-node-core/issues/82)) ([6ec85df](https://github.com/googleapis/google-cloud-node-core/commit/6ec85df968cd3aedce38e6345b2e1f8db9fab4b5))
* **deps:** Update dependency google-proto-files to v5 ([#124](https://github.com/googleapis/google-cloud-node-core/issues/124)) ([6e91f8a](https://github.com/googleapis/google-cloud-node-core/commit/6e91f8a0c73c7ece2406e9c84f9e6e1d439ecbe7))
* **deps:** Update dependency protobufjs to v7 ([#56](https://github.com/googleapis/google-cloud-node-core/issues/56)) ([748f35d](https://github.com/googleapis/google-cloud-node-core/commit/748f35d2dd27c68527dd6bb287b853faf6379c1c))
* **deps:** Update protobufjs to 7.2.5 ([426e7b4](https://github.com/googleapis/google-cloud-node-core/commit/426e7b4ff2ab9550dcc3f4c20d7c896626219984))
* Do not emit empty lists to JSON ([#15](https://github.com/googleapis/google-cloud-node-core/issues/15)) ([aaccf33](https://github.com/googleapis/google-cloud-node-core/commit/aaccf33b42ebdfc1f75efb8e597054a0ddc8cc92))
* Do not fail for unknown enum values ([#11](https://github.com/googleapis/google-cloud-node-core/issues/11)) ([62ce2a5](https://github.com/googleapis/google-cloud-node-core/commit/62ce2a54af5a5aaa5c89c07ad653ac520d54f5c6))
* Do not use Node.js assert ([#37](https://github.com/googleapis/google-cloud-node-core/issues/37)) ([5e91138](https://github.com/googleapis/google-cloud-node-core/commit/5e91138e7a9458b846d61ab6957c970270622891))
* Fix enum serialization in maps and repeated fields ([#129](https://github.com/googleapis/google-cloud-node-core/issues/129)) ([20d790e](https://github.com/googleapis/google-cloud-node-core/commit/20d790e3625469d6e09e467bf251598533dc6d4e))
* JSON accept special string for NaN, Infinity ([#19](https://github.com/googleapis/google-cloud-node-core/issues/19)) ([d28400d](https://github.com/googleapis/google-cloud-node-core/commit/d28400d8e75e1ccd91da6c0aebba261419cf0dc6))
* Keep nano second precision when maps between JSON and proto3 ([#28](https://github.com/googleapis/google-cloud-node-core/issues/28)) ([07caed1](https://github.com/googleapis/google-cloud-node-core/commit/07caed1348a0a246e9256fc1e78d99957e17ee46))
* Monorepo migration ([86a7376](https://github.com/googleapis/google-cloud-node-core/commit/86a7376da60852dae8eacf9ca97a6d302b6b7eb4))
* Properly convert repeated int64 and maps of int64 ([#96](https://github.com/googleapis/google-cloud-node-core/issues/96)) ([729472e](https://github.com/googleapis/google-cloud-node-core/commit/729472eb2a24df6f5e982691708dd478680ee5c2))
* Proto3jsonserializer ts config ([dfa0ab4](https://github.com/googleapis/google-cloud-node-core/commit/dfa0ab451c9a95dcb45699834565f7af19142cae))
* Repeated field can be null in JSON ([#66](https://github.com/googleapis/google-cloud-node-core/issues/66)) ([9ba14c9](https://github.com/googleapis/google-cloud-node-core/commit/9ba14c9836a3ed18d1668eb2c9b1133c6477ce6c))
* Switch typescript to tilde notation ([#137](https://github.com/googleapis/google-cloud-node-core/issues/137)) ([185846c](https://github.com/googleapis/google-cloud-node-core/commit/185846c43858d027db6d2c0f5a0a13a074add82a))
* Timestamp without millisecond ([#30](https://github.com/googleapis/google-cloud-node-core/issues/30)) ([a1b15f4](https://github.com/googleapis/google-cloud-node-core/commit/a1b15f40b230fe5bfe62206b94585a10c76bbb32))
* Use imported protobufjs in toproto3json.ts ([#9](https://github.com/googleapis/google-cloud-node-core/issues/9)) ([e4c35f0](https://github.com/googleapis/google-cloud-node-core/commit/e4c35f0a111be58ea308209d804a2a5b27f6591a))


### Miscellaneous Chores

* Require Node 14 ([#72](https://github.com/googleapis/google-cloud-node-core/issues/72)) ([096ee1a](https://github.com/googleapis/google-cloud-node-core/commit/096ee1ac4b65de5582e450b590b6edf73a876738))
* Upgrade to node 18 ([#113](https://github.com/googleapis/google-cloud-node-core/issues/113)) ([6b263ce](https://github.com/googleapis/google-cloud-node-core/commit/6b263ce83ff3c3785430bc392c2d47713e5e462f))

## [3.0.2](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v3.0.1...v3.0.2) (2025-08-12)


### Bug Fixes

* Switch typescript to tilde notation ([#137](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/137)) ([4ec0dd0](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/4ec0dd09201b07f30e5fcf5712198604d47d0cf9))

## [3.0.1](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v3.0.0...v3.0.1) (2025-06-27)


### Bug Fixes

* **deps:** Update dependency google-proto-files to v5 ([#124](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/124)) ([716bb43](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/716bb43b1c762b9d22b6d3097ba5f13169889dcc))
* Fix enum serialization in maps and repeated fields ([#129](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/129)) ([d84540a](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/d84540a956d598d2977f5b98718a55cd8b5b2f15))

## [3.0.0](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v2.0.2...v3.0.0) (2025-02-15)


### ⚠ BREAKING CHANGES

* upgrade to node 18 ([#113](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/113))

### Miscellaneous Chores

* Upgrade to node 18 ([#113](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/113)) ([f28a826](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/f28a826b838faaddb9ab93a52179e251517fad4d))

## [2.0.2](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v2.0.1...v2.0.2) (2024-05-22)


### Bug Fixes

* Properly convert repeated int64 and maps of int64 ([#96](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/96)) ([1ec05fb](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/1ec05fb59edfdff7531b9372dcfe14c0fe36562c))

## [2.0.1](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v2.0.0...v2.0.1) (2024-01-16)


### Bug Fixes

* **deps:** Update dependency google-proto-files to v4 ([#82](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/82)) ([72623e0](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/72623e04e1043353ef952178714ced733001a06d))
* **deps:** Update protobufjs to 7.2.5 ([a0f5c83](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/a0f5c833cba654949ec5e624fad1849020cf899d))

## [2.0.0](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v1.1.1...v2.0.0) (2023-08-07)


### ⚠ BREAKING CHANGES

* require Node 14 ([#72](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/72))

### Miscellaneous Chores

* Require Node 14 ([#72](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/72)) ([8681834](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/8681834d8bc204c40857e299570e1e5df4bc5618))

## [1.1.1](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v1.1.0...v1.1.1) (2023-04-25)


### Bug Fixes

* Repeated field can be null in JSON ([#66](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/66)) ([f81d3ab](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/f81d3ab202e2a674be73db8a9b74d3eecf3bbed4))

## [1.1.0](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v1.0.3...v1.1.0) (2022-08-26)


### Features

* option to serialize enum values as numbers ([#60](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/60)) ([456b771](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/456b771d5fef06d914c6e201fd9f17251e55d4d9))


### Bug Fixes

* remove pip install statements ([#1546](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/1546)) ([#58](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/58)) ([741d070](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/741d0704f49332dd5d66206fcdf2111464fb8759))

## [1.0.3](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v1.0.2...v1.0.3) (2022-07-10)


### Bug Fixes

* **deps:** update dependency protobufjs to v7 ([#56](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/56)) ([038fea5](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/038fea537c8809dc272c2352b832b5301c7b79d2))

## [1.0.2](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v1.0.1...v1.0.2) (2022-06-15)


### Bug Fixes

* **deps:** update dependency google-proto-files to v3 ([#53](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/53)) ([40fd527](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/40fd527109838a21887f7a5058406244acabe938))

## [1.0.1](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v1.0.0...v1.0.1) (2022-06-03)


### Bug Fixes

* **deps:** bump protobuf.js to ^6.11.3 ([#46](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/46)) ([af8a14a](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/af8a14a35c04cbef49bff806b7d906287d1d2c0d))

## [1.0.0](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.9...v1.0.0) (2022-05-12)


### ⚠ BREAKING CHANGES

* make Node 12 minimum language version (#38)

### Features

* make Node 12 minimum language version ([#38](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/38)) ([658d29e](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/658d29e531c2d04d4007e5843aa62d9d8ee0dae8))

### [0.1.9](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.8...v0.1.9) (2022-05-11)


### Bug Fixes

* do not use Node.js assert ([#37](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/37)) ([dccfeca](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/dccfeca6f3bbeec29d88319f375a734ec48aadf7))

### [0.1.8](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.7...v0.1.8) (2022-01-21)


### Bug Fixes

* timestamp without millisecond ([#30](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/30)) ([a55d0b6](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/a55d0b6f98f6d1c8b7d971d0a583bbd82ea66983))

### [0.1.7](https://github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.6...v0.1.7) (2022-01-14)


### Bug Fixes

* keep nano second precision when maps between JSON and proto3 ([#28](https://github.com/googleapis/proto3-json-serializer-nodejs/issues/28)) ([eaa01ce](https://github.com/googleapis/proto3-json-serializer-nodejs/commit/eaa01ce92c4eefa816d1d6f8ef6ed11bd2a6364b))

### [0.1.6](https://www.github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.5...v0.1.6) (2021-11-15)


### Bug Fixes

* **deps:** protobufjs is a dependency for the types ([#23](https://www.github.com/googleapis/proto3-json-serializer-nodejs/issues/23)) ([06470c1](https://www.github.com/googleapis/proto3-json-serializer-nodejs/commit/06470c1df501439ec3f8bc546cd23d798604f3bd))

### [0.1.5](https://www.github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.4...v0.1.5) (2021-10-26)


### Bug Fixes

* JSON accept special string for NaN, Infinity ([#19](https://www.github.com/googleapis/proto3-json-serializer-nodejs/issues/19)) ([01a345b](https://www.github.com/googleapis/proto3-json-serializer-nodejs/commit/01a345b7b1d62ee65a8673737975980d274fa22a))

### [0.1.4](https://www.github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.3...v0.1.4) (2021-09-20)


### Bug Fixes

* do not emit empty lists to JSON ([#15](https://www.github.com/googleapis/proto3-json-serializer-nodejs/issues/15)) ([af9dfd6](https://www.github.com/googleapis/proto3-json-serializer-nodejs/commit/af9dfd65efb84cfb31af0faca805f53b0ffa9874))

### [0.1.3](https://www.github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.2...v0.1.3) (2021-08-18)


### Bug Fixes

* do not fail for unknown enum values ([#11](https://www.github.com/googleapis/proto3-json-serializer-nodejs/issues/11)) ([ff9f0f1](https://www.github.com/googleapis/proto3-json-serializer-nodejs/commit/ff9f0f1881b1aafacd693b4e24eaee9e56aff79c))

### [0.1.2](https://www.github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.1...v0.1.2) (2021-08-17)


### Bug Fixes

* use imported protobufjs in toproto3json.ts ([#9](https://www.github.com/googleapis/proto3-json-serializer-nodejs/issues/9)) ([f6c86c7](https://www.github.com/googleapis/proto3-json-serializer-nodejs/commit/f6c86c777d567d8430b09dea3282e52af24d890f))

### [0.1.1](https://www.github.com/googleapis/proto3-json-serializer-nodejs/compare/v0.1.0...v0.1.1) (2021-08-04)


### Bug Fixes

* accept and return strings for int64 and uint64 ([#7](https://www.github.com/googleapis/proto3-json-serializer-nodejs/issues/7)) ([35689ec](https://www.github.com/googleapis/proto3-json-serializer-nodejs/commit/35689ecee55dbe6e4cf3327c535514d7fcb8332d))

## 0.1.0 (2021-08-03)


### ⚠ BREAKING CHANGES

* proto3 JSON serializer and deserializer (#2)

### Features

* proto3 JSON serializer and deserializer ([#2](https://www.github.com/googleapis/proto3-json-serializer-nodejs/issues/2)) ([96255a7](https://www.github.com/googleapis/proto3-json-serializer-nodejs/commit/96255a77c7714f33cae547db9160615d7f80a233))
