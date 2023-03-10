// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
figma.ui.resize(500, 500);

const readLocalStorage = async () => {
  const xLocal = await figma.clientStorage.getAsync("xVal");
  const yLocal = await figma.clientStorage.getAsync("yVal");
  const paddingPos = await figma.clientStorage.getAsync("paddingPos");
  const pageNumber = await figma.clientStorage.getAsync("pageNumber");
  const numberingType = await figma.clientStorage.getAsync("numberingType");
  figma.ui.postMessage(
    {
      xVal: xLocal,
      yVal: yLocal,
      paddingPos: paddingPos,
      pageNumber: pageNumber,
      numberingType: numberingType,
    },
    { origin: "*" }
  );
};

readLocalStorage();

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.

  msg.xVal = msg.xVal ? msg.xVal : 20;
  msg.yVal = msg.yVal ? msg.yVal : 20;
  msg.count = msg.count ? msg.count : 1;

  figma.clientStorage.setAsync("xVal", msg.xVal);
  figma.clientStorage.setAsync("yVal", msg.yVal);
  figma.clientStorage.setAsync("paddingPos", msg.paddingFlipper);
  figma.clientStorage.setAsync("pageNumber", msg.count);
  figma.clientStorage.setAsync("numberingType", msg.numberingType);

  if (msg.type === "create-rectangles") {
    const nodes: SceneNode[] = [];
    var frameArray = [];
    var i = msg.count;
    var counter = 0;
    var sortedFrameArray = [];
    var frameNodes = figma.currentPage.findAllWithCriteria({
      types: ["FRAME"],
    });

    for (const node of figma.currentPage.selection) {
      // frameArray[0] = node.id;
      // frameArray[i][1] = node.x;
      // frameArray[i][2] = node.y;
      frameArray.push({
        id: node.id,
        x: node.x,
        y: node.y,
      });
    }

    if (msg.numberingType == 1) {
      sortedFrameArray = frameArray.sort(function (a, b) {
        return a.x - b.x || a.y - b.y;
      });
    } else {
      sortedFrameArray = frameArray.sort(function (a, b) {
        return a.y - b.y || a.x - b.x;
      });
    }

    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    for (const obj of figma.currentPage.selection) {
      let newObj = obj as FrameNode;
      let x = findIndexOf(obj.id, sortedFrameArray, i);
      if (!newObj.findChild((n) => n.name === "PageNumberText")) {
        var text = figma.createText();
        text.name = "PageNumberText";
        text.characters = x;
        text.fontName = { family: "Roboto", style: "Regular" };
        text.fontSize = 18;
        text.textAlignHorizontal = "RIGHT";
        text.fills = [
          { type: "SOLID", color: { r: 71 / 255, g: 73 / 255, b: 90 / 255 } },
        ];
        if (msg.paddingFlipper < 0) {
          text.x = newObj.width - msg.xVal - text.width;
          text.y = newObj.height - msg.yVal - text.height;
        } else {
          text.x = Number(msg.xVal);
          text.y = Number(msg.yVal);
        }
        newObj.appendChild(text);
      } else {
        var textChild = newObj.findChild(
          (n) => n.name === "PageNumberText"
        ) as TextNode;
        textChild.characters = x;
        if (msg.paddingFlipper < 0) {
          textChild.x = newObj.width - msg.xVal - textChild.width;
          textChild.y = newObj.height - msg.yVal - textChild.height;
        } else {
          textChild.x = Number(msg.xVal);
          textChild.y = Number(msg.yVal);
        }
      }
    }

    figma.notify("Added page number successfully ✨");
    var finalPageNumberObj = figma.currentPage.findAll(
      (n) => n.name === "PageNumberText"
    );

    figma.currentPage.selection = [];
    figma.currentPage.selection = finalPageNumberObj;
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};

function findIndexOf(id: string, sortedFrameArray: any[], i: number): string {
  for (const obj of sortedFrameArray) {
    if (obj.id === id) {
      return "" + i;
    }
    i++;
  }
}

function updateInputValues() {}
