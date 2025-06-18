#!/bin/bash
echo "🔍 Running Pylint on Django app (racing)..."
pylint --load-plugins=pylint_django racing/ > pylint_report.txt
 
echo "Report generated pylint_report.txt"


