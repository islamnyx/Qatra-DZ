global asm_xor_mix
global asm_memzero

section .text

asm_xor_mix:
    ; rdi = data pointer, rsi = length, rdx = seed
    mov rax, rdx
    test rsi, rsi
    jz .done
.loop:
    movzx rcx, byte [rdi]
    rol rax, 13
    xor rax, rcx
    inc rdi
    dec rsi
    jnz .loop
.done:
    ret

asm_memzero:
    ; rdi = buffer, rsi = length
    cmp rsi, 0
    je .zerodone
    xor al, al
    rep stosb
.zerodone:
    mfence
    ret
