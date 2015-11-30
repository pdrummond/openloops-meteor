Ols.FullScreenEditor = {
	open() {
		$("#full-screen-editor-wrapper").show();
	},

	close() {
		$("#full-screen-editor-wrapper").hide();
	},

	onBeforeClose(callback) {
		this.onBeforeCloseCallback = callback;
	}
}
