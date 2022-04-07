export const TestPlugin=
    `async function main() {
    let inputs = await rxjs.firstValueFrom(
        UtopiaApi.getInputsFromUser({
            inputs: [
                {
                    label: "Source Block Type",
                    name: "sourceBlock",
                    type: "blockType",
                    hint: "Blocks of this type will turn into a random color block",
                    required: false,
                    isList: true
                },  {
                    label: "Source Block Type",
                    name: "sourceBlock1",
                    type: {
                        inputs:[
                                    {
                                label: "",
                                name: "sourceBlock3",
                                type: "blockType",
                                hint: "Blocks of this type will turn into a random color block",
                                required: false,
                            },
                            {
                                label: "",
                                name: "sourceBlock2",
                                type: "blockType",
                                hint: "Blocks of this type will turn into a random color block",
                                required: false,
                            }
                        ],
                        gridDescriptor: {
                            rows: [
                                ["sourceBlock2", "sourceBlock3"],
                            ],
                            templateColumns: "1fr 0.5fr"
                        }
                    },
                    isList: true,
                    hint: "Blocks of this type will turn into a random color block",
                    required: true
                },
            ],
            gridDescriptor: {
                rows: [
                    ["sourceBlock", "sourceBlock1"],
                ],
                templateColumns: "400px 600px",
                templateRows: "300px"
            },
        })
    );
}`;
