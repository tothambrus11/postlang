# PostLang
PostLang is a new, component based markup language. It can be converted into HTML. Currently, the package only contains the parser, so anyone can write their own renderer.
## Components
Like in html, you can write components that have arguments and body. In postlang the body is also called 'content'. Here is an example of a normal tag:
```
task(title="Exercise 3." solution="6"){
    "The answer is 3!"
}
``` 
It has 2 attributes: title and solution. The values of each attribute must be "between two quotation marks". The attributes are either separated by a comma or a whitespace character (\n, space, \t)
If the tag doesn't require a body, you don't have to write {""}:
```
video(source="https://www.youtube.com/watch?v=UfDFTCIZfEg" autoplay="true")
```
If you don't need arguments:
```
paragraph{
    "Lorem ipsum dolor sit amet."
}
```
Or if you don't need any of them:
```
br
```
