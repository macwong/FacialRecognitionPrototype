exports.captureBytes = (ctx, videoEl, canvasEl) => {
    ctx.drawImage(videoEl, 0, 0);
    return canvasEl.toDataURL("image/png");
};