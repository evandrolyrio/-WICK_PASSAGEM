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
				ReimpressaoSet: [],
				Impressora: "",
				Peso: ""
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
			
			if ( !oDialogData.Aufnr ) {
				oDialogData.Aufnr = "0";
			}
			var oModel = this.getModel();


			this.getModel("viewModel").setProperty("/busy", true);
			oModel.invalidate();
			oModel.callFunction("/GetPassagem", {
				method: "GET",
				urlParameters: {
					Aufnr: oDialogData.Aufnr
				},
				success: function(oData) {
					that.getModel("viewModel").setProperty("/PassagemSet", oData.results);
					that.getModel("viewModel").setProperty("/busy", false);
					that.getView().byId("tbPassagem").getBinding("items").refresh();
				},
				error: function(error) {
					// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
					// oGeneralModel.setProperty("/sideListBusy", false);
					that.getModel("viewModel").setProperty("/busy", false);
				}
			});
		},		
		Imprimir: function(oEvent) {

		}
	});
});