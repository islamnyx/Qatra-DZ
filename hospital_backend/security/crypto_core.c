#include <stdint.h>
#include <stddef.h>

extern uint64_t asm_xor_mix(const uint8_t *data, size_t length, uint64_t seed);
extern void asm_memzero(void *buffer, size_t length);

uint64_t secure_xor_checksum(const char *data, size_t length, uint64_t seed) {
    return asm_xor_mix((const uint8_t *)data, length, seed);
}

void secure_wipe(void *buffer, size_t length) {
    asm_memzero(buffer, length);
}
