export default function PiracyBarcode(value) {
    const data = [];
    const dataa = [];
    let barcodeValue = value;

    let searchBarcode = value;
    let foundBarcode = null;
    let barcodeCount = null;
    let submittedBarcode = "";
    let displayedDorderid = "";
    console.log(barcodeValue);
   

    
    function fetchData() {
      fetch("https://nodei.ssccglpinnacle.com/getship")
        .then((response) => response.json())
        .then((responseData) => {
          data.push(...responseData.reverse());
          console.log(data);
        });
  
      fetch("https://nodei.ssccglpinnacle.com/getApproveDPO")
        .then((response) => response.json())
        .then((responseData) => {
          dataa.push(...responseData.reverse());
        });
    }
  
    function postBarcodeToMongoDB() {
      fetch("https://nodei.ssccglpinnacle.com/barcodeadd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barcode: searchBarcode }),
      })
        .then(() => console.log("Barcode posted to MongoDB successfully."))
        .catch((error) => console.error("Error posting barcode to MongoDB:", error));
    }
  
    async function getCountFromAPI(barcode) {
      try {
        const response = await fetch("https://nodei.ssccglpinnacle.com/count", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ barcode }),
        });
        const responseData = await response.json();
        barcodeCount = responseData.count;
      } catch (error) {
        console.error("Error getting barcode count:", error);
      }
    }
  
    function handleSearch() {
      if (searchBarcode.trim() === "") {
        alert("Please enter a barcode before submitting.");
        return;
      }
  
      let found = false;
      let orderNum = null;
  
      data.forEach((item) => {
        if (item.barcodeData) {
          item.barcodeData.forEach((barcode) => {
            if (barcode.scannedData && barcode.scannedData.includes(searchBarcode)) {
              found = true;
              orderNum = barcode.OrderNum;
              return;
            }
          });
        }
      });
  
      foundBarcode = found
        ? "verified"
        : "This book does not belong to Pinnacle so this is a duplicate book.";
  
      submittedBarcode = searchBarcode;
      searchBarcode = "";
  
      if (found) {
        postBarcodeToMongoDB();
  
        const matchingOrder = dataa.find((order) => order.shipmentid === orderNum);
  
        if (matchingOrder) {
          displayedDorderid = matchingOrder.Dorderid;
          console.log(`Dorderid: ${matchingOrder.Dorderid}`);
        } else {
          displayedDorderid = "";
        }
      } else {
        displayedDorderid = "";
      }
  
      getCountFromAPI(searchBarcode);
      barcodeCount = null;
    }
  
    document.querySelector(".search-button").addEventListener("click", handleSearch);
  
    fetchData();
    
  }
  