sap.ui.define([
	"PassagemZPP_PASSAGEM/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, BarcodeScanner, MessageBox) {
	"use strict";

	return BaseController.extend("PassagemZPP_PASSAGEM.controller.Passagem", {

		onInit: function() {

			this.setModel(this.getOwnerComponent().getModel());

			this.setModel(new JSONModel({
				busy: false,
				//FilterData
				PassagemSet: [],
				Aufnr: ""
			}), "viewModel");
			var that = this;
			// this._currentContext = this.getSource().getBindingContext();
			this.oDialog = new sap.ui.xmlfragment("PassagemZPP_PASSAGEM.view.fragment.DisplayPassDialog", this);
			if (this.oDialog) {
				this.getView().addDependent(this.oDialog);

				this.oDialog.setModel(this.getModel());
				this.oDialog.setModel(new JSONModel({
					Aufnr: ""
				}, "dialog"));

				this.oDialog.setBindingContext(this._currentContext);
				// this.oDialog.setBindingContext(that);
				this.oDialog.open();
			}			
		},
		goToPass: function(oEvent) {
			var oDialogData = this.oDialog.getModel().getData();
			var that = this;
			this.oDialog.close();
			this.oDialog.destroy(true);
			
			var oModel = this.getModel();

			this.getModel("viewModel").setProperty("/busy", true);
			oModel.invalidate();
			oModel.callFunction("/GetPassagem2", {
				method: "GET",
				urlParameters: {
					Aufnr: oDialogData.Aufnr
				},
				success: function(oData) {
					if (!oData.Barcode) {
						MessageBox.information("Não foi possível localizar a ordem informada.");
						that.getModel("viewModel").setProperty("/busy", false);
						that.navigateBack();
					} else {
						that.getModel("viewModel").setProperty("/Aufnr", oData.Barcode);
					    that.getModel("viewModel").setProperty("/busy", false);
					    // that.oDialog.close();
						// that.oDialog.destroy(true);
						// that.scanHU().then(function (scanned) {
							// var barcode = scanned;
							var oModel2 = that.getModel();
							oModel2.invalidate();
							oModel2.callFunction("/Transferencia", {
								method: "GET",
								urlParameters: {
									User: 'N',
									Barcode: '0011',
									Aufnr: that.getModel("viewModel").getProperty("/Aufnr")
								},
								success: function(Data) {	
									if	(Data.results.length === that.getView().byId("tbPassagem").getBinding("items").iLength) {
										// MessageBox.information("Etiqueta já lida");
									} else {
										that.getModel("viewModel").setProperty("/PassagemSet", Data.results);
										that.getModel("viewModel").setProperty("/busy", false);
										that.getView().byId("tbPassagem").getBinding("items").refresh();
										// that.lerCod();
									}
								},
								error: function(error) {
									that.getModel("viewModel").setProperty("/busy", false);
									// MessageBox.information("Etiqueta já lida");
								}
							});	
						// });																
					}
				},
				error: function(error) {
					// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
					// oGeneralModel.setProperty("/sideListBusy", false);
					MessageBox.information("Para essa OP as etiquetas já foram processadas na passagem");
					that.getModel("viewModel").setProperty("/busy", false);
				}
			});
		},		
		lerCod: function() {
			var that = this;
			this.scanHU().then(function (scanned) {
				var barcode = scanned;
				var oModel = that.getModel();
				oModel.invalidate();
				oModel.callFunction("/Transferencia", {
					method: "GET",
					urlParameters: {
						User: 'O',
						Barcode: barcode,
						Aufnr: that.getModel("viewModel").getProperty("/Aufnr")
					},
					success: function(oData) {	
						if	(oData.results.length === that.getView().byId("tbPassagem").getBinding("items").iLength) {
							MessageBox.information("Não foi possível localizar a etiqueta ou Etiqueta já lida");
						} else {						
							that.getModel("viewModel").setProperty("/PassagemSet", oData.results);
							that.getModel("viewModel").setProperty("/busy", false);
							that.getView().byId("tbMontaKIT").getBinding("items").refresh();
							that.lerCod();
						}
					},
					error: function(error) {
						that.getModel("viewModel").setProperty("/busy", false);
						// MessageBox.information("Etiqueta já lida");
					}
				});	
			});					
		},
		onCloseDialog: function() {
			this.oDialog.close();
			this.oDialog.destroy(true);
		}	
	});
});