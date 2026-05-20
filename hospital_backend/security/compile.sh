#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v nasm >/dev/null || ! command -v gcc >/dev/null; then
  echo "Error: gcc and nasm are required to compile the security library."
  exit 1
fi

platform=$(uname -s)
case "$platform" in
  Linux|Darwin)
    nasm -f elf64 asm_helpers.asm -o asm_helpers.o
    gcc -c -O3 -fPIC crypto_core.c -o crypto_core.o
    gcc -shared crypto_core.o asm_helpers.o -o libcrypto_core.so
    echo "Built security/libcrypto_core.so"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    nasm -f win64 asm_helpers.asm -o asm_helpers.o
    gcc -c -O3 -o crypto_core.o crypto_core.c
    gcc -shared crypto_core.o asm_helpers.o -o crypto_core.dll
    echo "Built security/crypto_core.dll"
    ;;
  *)
    echo "Unsupported platform: $platform"
    exit 1
    ;;
 esac
