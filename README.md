# Advanced Cryptography & Security Suite

A small browser-based tool for playing with classic ciphers. It can encrypt/decrypt text and files using Caesar and Vigenère ciphers, and it can also try to crack a Caesar cipher automatically by testing all 25 possible shifts and guessing which one produces real English text.

Built with plain HTML, CSS, and JavaScript — no frameworks, no libraries, nothing to install.

## What it does

- **Cipher tab** — type text and see it encrypted/decrypted live, using either Caesar (pick a shift) or Vigenère (pick a keyword)
- **File Encryption tab** — upload a `.txt` file, encrypt or decrypt its contents, and download the result
- **Crack a Cipher tab** — paste in Caesar-encrypted text and it will try every shift and rank the results by how much they look like real English

## How the cracking works

Caesar ciphers only have 25 possible shifts, so instead of guessing, the tool just tries all of them. For each attempt, it checks what percentage of the resulting words are common English words. The attempt with the highest percentage is probably the correct one.

## Running it

No setup needed — just open `index.html` in a browser. Or clone the repo:

```bash
git clone https://github.com/<your-username>/Advanced-Cryptography-and-Security-Suite.git
```

## Files

```
index.html      -> page structure
css/style.css   -> styling
js/script.js    -> cipher logic and the cracking tool
```

## Note

Caesar and Vigenère ciphers are old and easy to break with today's tools — this project is meant for learning, not for actually protecting sensitive data.
