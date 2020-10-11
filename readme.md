# PostLang
PostLang is a component based markup language. It can be converted into HTML. Currently, the package only contains the parser, so anyone can write their own renderer.
To use this package, you have to make sure that NodeJS is installed on your machine.

You can try out the language on this page: https://johetajava.hu/postlang-demo/

# Language Specification
## Components
Like in html, you can write components that have arguments and body. In postlang the body is also called 'content'. Here is an example of a normal tag:
```
task(title="Exercise 3." solution="6") {
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
paragraph {
    "Lorem ipsum dolor sit amet."
}
```
Or if you don't need any of them:
```
br
```
## The Content of an element
The Content of an element can be either
__An element:__
```
outerElement {
    innerElement {
        "Inner element content"
    }
}
```
__A string between quotation marks:__
```
outerElement {
    "String content"
}
```
__a list of Contents__
```
list(orderType="numbers") {
    [
        "This is the first element",
        video(source="kMYp-c2pbZw" type="youtube"),
        list(orderType="letters") {
            [
                "This is a list inside a list."
            ]
        }
    ]
}
```
## API
__Importing:__
```javascript
const postlang = require("postlang");
```
__Parsing code:__
```javascript
postlang.parseCode("code...");
```
It returns a list of components in the code:
```typescript
interface Component {
    componentName: string;
    attributes: Attributes;
    content: Content;
};

type Attributes = { [key: string]: any }

type Content = string | Component | Content[] | null

```

Here is an example output of the parser:

```json
[
    {
        "componentName": "heading",
        "attributes": {
            "level": "1"
        },
        "content": "Title 1"
    },
    {
        "componentName": "list",
        "attributes": {
            "orderType": "numbers"
        },
        "content": [
            "This is the first item.",
            "This is the second item",
            {
                "componentName": "video",
                "attributes": {
                    "type": "youtube",
                    "source": "kMYp-c2pbZw"
                },
                "content": null
            }
        ]
    },
    {
        "attributes": {},
        "componentName": "hr",
        "content": null
    }
]

```
