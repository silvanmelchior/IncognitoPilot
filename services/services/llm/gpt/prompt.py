FUNCTIONS = [
    {
        "name": "run_python_code",
        "description": "Runs arbitrary Python code and returns stdout and stderr. "
        + "The code is executed in an interactive shell, imports and variables are preserved between calls. "
        + "The environment has internet and file system access. "
        + "The current working directory is shared with the user, so files can be exchanged. "
        + "There are many libraries pre-installed, including numpy, pandas, matplotlib, and scikit-learn. "
        + "You cannot show rich outputs like plots or images, but you can store them in the working directory and point the user to them. "
        + "If the code runs too long, there will be a timeout.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The Python code to run",
                },
            },
            "required": ["code"],
        },
    },
]
