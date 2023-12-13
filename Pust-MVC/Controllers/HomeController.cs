using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Pust_MVC.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";
            List<string> strings = new List<string>();
            strings.Add("asdasd");
            strings.Add("asdasd");
            strings.Add("asdasd");
            strings.Add("asdasd");
            ViewData["stringData"] = strings;
            return View();
        }
    }
}