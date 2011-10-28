#!/usr/bin/env node

var editor = process.env.EDITOR
           || (process.platform === "win32" ? "notepad" : "vim")

var child_process = require("child_process")
var fs = require("fs")
var path = require("path")
var tmp = process.env.TMPDIR || process.env.TEMP || process.env.TMP || "/tmp"

if (process.argv.length !== 3) {
  console.error("Usage: hexedit <file>")
  process.exit(1)
}

var file = path.resolve(process.argv[2])

tmp += "/.hexedit-" + (file.replace(/[\/\. \t]/g, "-")) + ".hex"

var hexy = require("hexy").hexy
var buf = new Buffer(
  ["# offset: data                                    # ASCII value."]
  .concat(
    hexy(fs.readFileSync(file))
      .split("\n")
      .map(function (s) {
         return s.replace(/^(.{50})/, "$1#")
      })
  ).join("\n")
)

fs.writeFileSync(tmp, buf)
fs.watch(tmp, update)

// if it takes less than 100ms to exit, then something is very wrong.
var start = Date.now()
child_process.spawn(editor, [tmp], { customFds: [ 0, 1, 2 ] })
  .on("exit", function (c) {
    var end = Date.now()
    if (end - start < 100) {
      console.error("Editor exited immediately.")
      return update(true, 1)
    }

    c = c || 0
    console.error("editor exited with "+c)
    update(true, c)
  })

var ut
function update (exit, code) {
  if (ut) clearTimeout(ut)
  ut = setTimeout(function () {
    clearTimeout(ut)
    ut = null
    var c = fs.readFileSync(tmp)
    c = c.toString("utf8")
    c = c.split("\n").map(function (c) {
      return c.replace(/#.*$/g, "")
              .replace(/^[^:]+:/, "")
              .replace(/[\n\r\t\s ]/g, "")
              .trim()
    })
    c = c.join("")
    c = c.trim()

    // check the bytes
    var bytes
    try {
      bytes = new Buffer(c, "hex")
    } catch (ex) {
      console.error(ex.message)
      if (exit === true && typeof code === "number") {
        process.exit(code || 1)
      }
      return
    }

    fs.writeFileSync(file, bytes)
    if (true === exit && typeof code === "number") {
      console.error("exiting")
      fs.unlinkSync(tmp)
      process.exit(code)
    }
  }, 100)
}
