using Compunet.YoloV8;
using Compunet.YoloV8.Plotting;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;

namespace ComputerVisionEncodeclubProject.Controllers
{
    public class HomeController : Controller
    {

        public IActionResult Index()
        {
            return View();
        }

        [Route("object-identification")]
        public IActionResult ObjectIdentification()
        {
            return View();
        }

        [HttpPost]
        [Route("object-identification")]
        public async Task<IActionResult> ObjectIdentification(string imageUrl)
        {
            TempData["ImageUrl"] = imageUrl;

            var image = await DownloadImage(imageUrl);

            string modelPath = Path.Combine(Directory.GetCurrentDirectory(), "yolov8n.onnx");

            using var predictor = YoloV8Predictor.Create(modelPath);

            var result = await predictor.DetectAsync(image);

            var viewModel = result.Boxes.Select(x => new { x.Confidence, x.Class.Name })
                .AsEnumerable()
                .Select(x => new Tuple<float, string>(x.Confidence, x.Name))
                .ToList();

            return View(viewModel);
        }

        [Route("image-segmentation")]
        public IActionResult ImageSegmentation()
        {
            return View();
        }

        [HttpPost]
        [Route("image-segmentation")]
        public async Task<IActionResult> ImageSegmentation(string imageUrl)
        {
            TempData["OriginalImage"] = imageUrl;

            var imageBytes = await DownloadImage(imageUrl);

            string modelPath = Path.Combine(Directory.GetCurrentDirectory(), "yolov8n-seg.onnx");

            using var image = Image.Load(imageBytes);

            using var predictor = YoloV8Predictor.Create(modelPath);

            var result = await predictor.SegmentAsync(image);

            using Image plotted = await result.PlotImageAsync(image);

            var base64Img = plotted.ToBase64String(plotted.Metadata.DecodedImageFormat);

            TempData["SegmentedImage"] = base64Img;

            return View();
        }

        [Route("live-object-detection")]
        public IActionResult LiveDetection()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> LiveStream([FromBody] string imgData)
        {
            string modelPath = Path.Combine(Directory.GetCurrentDirectory(), "yolov8n-seg.onnx");

            using var image = Image.Load(Convert.FromBase64String(imgData.Replace("data:image/png;base64,", "")));

            var predictor = YoloV8Predictor.Create(modelPath);

            var result = await predictor.SegmentAsync(image);

            using Image plotted = await result.PlotImageAsync(image);

            var base64Img = plotted.ToBase64String(plotted.Metadata.DecodedImageFormat);

            return Json(new { imgData = base64Img });

        }

        private static async Task<byte[]> DownloadImage(string imageUrl)
        {
            using HttpClient client = new();
            byte[] imageBytes = await client.GetByteArrayAsync(imageUrl);
            return imageBytes;
        }
    }
}
