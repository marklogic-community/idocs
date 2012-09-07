
let $orig-url     := xdmp:get-request-url()
let $path         := xdmp:get-request-path()  
let $query-string := substring-after($orig-url, '?')

return 

if (starts-with($path, "/rex/")) then
    concat("/xquery/rex.xqy?path-and-query=", xdmp:url-encode(concat(replace($path, "/rex", ""), "?", $query-string)))
else
    xdmp:get-request-url()

