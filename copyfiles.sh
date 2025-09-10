# shellcheck shell=bash

if [[ ! -d dist/p/ ]]; then
    mkdir dist/p/
fi
cp src/content/posts/p/lovemilk-telemetry-EULA.md dist/p/
