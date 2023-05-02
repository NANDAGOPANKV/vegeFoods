const excel = require("exceljs");
const Orders = require("../../models/adminSchema/orderSchema");

const getOrders = async (req, res) => {
  try {
    let workBook = new excel.Workbook();
    let workSheet = workBook.addWorksheet("My Orders");

    workSheet.columns = [
      { header: "S no.", key: "no" },
      { header: "Order ID", key: "_id" },
      { header: "Address", key: "address" },
      { header: "Total Amount", key: "totalAmount" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Order Status", key: "orderStatus" },
      { header: "Order Date", key: "date" },
    ];

    let counter = 1;

    let ordersData = await Orders.find().lean();

    ordersData.forEach((order) => {
      order.no = counter;
      order.totalAmount = order.totalAmount.toString(); // convert to string
      workSheet.addRow(order);
      counter++;
    });

    workSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
    );

    res.setHeader("Content-Disposition", `attachment; filename=orders.xlsx`);

    return workBook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    res.json({ error });
  }
};

module.exports = { getOrders };
