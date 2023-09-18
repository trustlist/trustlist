#!/bin/bash
set -m

yarn contracts hardhat node --hostname 0.0.0.0 &
sleep 3
yarn contracts deploy

fg %1
