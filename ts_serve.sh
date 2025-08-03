#! /bin/bash

set -x

tailscale serve --http=3333 --bg 127.0.0.1:3333
