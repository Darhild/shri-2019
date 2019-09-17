module.exports = {
    menuItemAfter: function (width = "5px", height = "5px", right = "15px", bottom = "15px", color = "black") {
        return {
            "position": "relative",

            "&:after": {
                "content": "",
                "position": "absolute",
                "right": `${right}`,
                "bottom": `${bottom}`,
                "display": "block",
                "width":  `${width}`,
                "height": `${height}`,
                "border-top": `1px solid ${color}`,
                "border-left": `1px solid ${color}`,
                "transform": "rotate(225deg)"
            }    
        }        
    }    
}


