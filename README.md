This is a hexadecimal editor.  Here's how it works:

1. You type `hexedit blah.bin`
2. It dumps out the contents of `blah.bin` in hex to a temporary text file.
3. **Every time you save that file**, it picks up the change and writes
   the alteration back to `blah.bin`.
4. When the editor exits, it writes the change back to `blah.bin`.

Each line in the editor is something like this:

    # offset: data                                     # ASCII value.
    00000000: 5468 6973 2069 7320 6120 6865 7861 6465  # This.is.a.hexade
    00000010: 6369 6d61 6c20 6564 6974 6f72 2e20 2048  # cimal.editor...H
    00000020: 6572 6527 7320 686f 7720 6974 2077 6f72  # ere's.how.it.wor
    00000030: 6b73 3a0a 0a31 2e20 596f 7520 7479 7065  # ks:..1..You.type

The annotations and whitespace are just for your benefit, and are
ignored by the program.  Everything before the first `:`, or after the
first `#` is removed.  Whitespace is stripped.  If there are any invalid
hex characters after this transformation, or if the result is an odd
number of hex digits, then an error is thrown.
