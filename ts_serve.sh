#! /bin/bash

set -x

tailscale serve --https=5174 --bg 127.0.0.1:5174
