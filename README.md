# sheep-js

Javascript module implementation of sheep.exe ((c) Tatsutoshi Nomura) ES6 style + vite

v1.0 beta

## build lib

npm ci
npm run build

## demo/test

npm ci
npm run dev

## Usage

### import lib

npm i sheep-js

## use in a module

import Sheep from 'sheep'

new Sheep({
floors: 'window, .floor, .p-toolbar, .ajs-modal, .p-dialog, .p-row-even' // any class/element you want as floor
})
