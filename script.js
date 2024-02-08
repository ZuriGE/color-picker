window.onload = () => {
	const imgInput = document.getElementById("imgInput");
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d", { willReadFrequently: true });

	// const btn = document.getElementById("btnGenerate");
	const palette = document.getElementById("colorContainer");
	const randomPic = document.getElementById("randomPic");
	const loader = document.getElementById("loader-container");
	loader.style.display = "none";

	const copyRootBtn = document.getElementById("copyRoot");

	//info para el canvas
	const MAX_WIDTH = canvas.clientWidth;
	const MAX_HEIGHT = canvas.clientHeight;
	const BORDER_RADIUS = 8;

	let imgLoaded = false;

	const randomIntBetween = (a, b) => {
		return Math.floor(Math.random() * (b - a + 1)) + a;
	};

	const qty = 5;

	const reload = () => {
		palette.innerHTML = "";
		loader.style.display = "flex";
	};

	//para que la imagen cargada aparezca instantáneamente en el front
	imgInput.addEventListener("change", (e) => {
		let file = e.target.files[0];
		let fr = new FileReader();

		fr.onload = () => {
			const img = new Image();

			img.onload = () => {
				reload();

				let width = img.width;
				let height = img.height;
				// Calcula las nuevas dimensiones manteniendo la proporción
				if (width > MAX_WIDTH || height > MAX_HEIGHT) {
					let aspectRatio = width / height;
					if (width > height) {
						width = MAX_WIDTH;
						height = width / aspectRatio;
					} else {
						height = MAX_HEIGHT;
						width = height * aspectRatio;
					}
				}
				canvas.width = width;
				canvas.height = height;
				//para que los bordes sean redondeados
				ctx.beginPath();
				ctx.moveTo(BORDER_RADIUS, 0);
				ctx.arcTo(width, 0, width, height, BORDER_RADIUS);
				ctx.arcTo(width, height, 0, height, BORDER_RADIUS);
				ctx.arcTo(0, height, 0, 0, BORDER_RADIUS);
				ctx.arcTo(0, 0, width, 0, BORDER_RADIUS);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(img, 0, 0, width, height);
				imgLoaded = true; // Marca la imagen como cargada
			};
			img.src = fr.result;
		};
		fr.readAsDataURL(file);

		setTimeout(() => {
			getPalette();
		}, 200);
	});

	randomPic.addEventListener("click", () => {
		// Generar un número aleatorio entre 1 y 6
		let index = Math.floor(Math.random() * 17) + 1;

		// Crear una nueva imagen
		let img = new Image();

		reload();

		// Agregar un listener para cargar la imagen una vez que esté cargada
		img.onload = () => {
			let width = img.width;
			let height = img.height;
			// Calcula las nuevas dimensiones manteniendo la proporción
			if (width > MAX_WIDTH || height > MAX_HEIGHT) {
				let aspectRatio = width / height;
				if (width > height) {
					width = MAX_WIDTH;
					height = width / aspectRatio;
				} else {
					height = MAX_HEIGHT;
					width = height * aspectRatio;
				}
			}
			canvas.width = width;
			canvas.height = height;
			//para que los bordes sean redondeados
			ctx.beginPath();
			ctx.moveTo(BORDER_RADIUS, 0);
			ctx.arcTo(width, 0, width, height, BORDER_RADIUS);
			ctx.arcTo(width, height, 0, height, BORDER_RADIUS);
			ctx.arcTo(0, height, 0, 0, BORDER_RADIUS);
			ctx.arcTo(0, 0, width, 0, BORDER_RADIUS);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(img, 0, 0, width, height);
			imgLoaded = true; // Marca la imagen como cargada
		};

		img.src = `assets/muestra_${index}.jpg`;
		setTimeout(() => {
			getPalette();
		}, 200);
	});

	const getPalette = (e) => {
		if (e) {
			e.preventDefault();
		}

		reload();

		//con esto obtenemos el valor de cada pixel
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const pixels = imageData.data;
		let rgbPixels = [];

		// Recorre los datos de píxeles y obtener los valores RGB y alfa
		for (let i = 0; i < pixels.length; i += 4) {
			const red = pixels[i];
			const green = pixels[i + 1];
			const blue = pixels[i + 2];
			const alpha = pixels[i + 3];

			const thisPixel = [red, green, blue];

			//si no es transparencia
			if (alpha != 0) {
				rgbPixels.push(thisPixel);
			}
		}

		//algoritmo k-medias
		let result = kMeans(rgbPixels, qty, 200);

		let mainColors = result.centroids.map((centroid) => {
			return centroid.map((num) => Math.round(num));
		});

		let copyRoot = `:root {`;
		for (let i = 0; i < mainColors.length; i++) {
			if (mainColors[i].length === 3) {
				let r = mainColors[i][0];
				let g = mainColors[i][1];
				let b = mainColors[i][2];

				let textColor = getContrastColor(r, g, b);

				let newColor = document.createElement("div");
				newColor.classList.add("paletteColor");
				newColor.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

				let hexR = r.toString(16);
				let hexG = g.toString(16);
				let hexB = b.toString(16);

				if (hexR.length < 2) {
					hexR = "0" + hexR;
				}
				if (hexG.length < 2) {
					hexG = "0" + hexG;
				}
				if (hexB.length < 2) {
					hexB = "0" + hexB;
				}

				let hexadecimal = `#${hexR}${hexG}${hexB}`;

				let hexaCode = document.createElement("span");
				hexaCode.style.color = textColor;
				hexaCode.innerText = hexadecimal;

				let colorName = document.createElement("span");
				colorName.style.color = textColor;
				colorName.innerText = ntc.name(hexadecimal);

				//Botón para copiar un único color
				let copyBtn = document.createElement("button");
				copyBtn.classList.add("copyBtn");
				let copyIcon = document.createElement("i");
				copyIcon.style.color = textColor;
				copyIcon.classList.add("fa-regular", "fa-copy");
				copyBtn.appendChild(copyIcon);

				copyBtn.addEventListener("click", () => {
					let tempInput = document.createElement("input");
					tempInput.value = hexadecimal;

					// Agregar el elemento temporal al DOM
					document.body.appendChild(tempInput);

					// Seleccionar el texto dentro del elemento temporal
					tempInput.select();

					// Ejecutar el comando de copiar
					document.execCommand("copy");

					// Eliminar el elemento temporal del DOM
					document.body.removeChild(tempInput);
				});
				newColor.appendChild(hexaCode);
				colorName.appendChild(copyBtn);

				newColor.appendChild(colorName);

				if (i == 0) {
					newColor.style.position = "relative";

					let updateBtn = document.createElement("button");
					updateBtn.classList.add("refreshBtn");
					updateBtn.setAttribute("id", "btnGenerate");

					updateBtn.onclick = () => {
						reload();
						setTimeout(() => {
							getPalette();
						}, 200);
					};

					let icon = document.createElement("i");
					icon.classList.add("fa-solid");
					icon.classList.add("fa-arrows-rotate");
					icon.style.color = textColor;

					updateBtn.appendChild(icon);

					newColor.appendChild(updateBtn);
				}

				palette.appendChild(newColor);
				copyRoot = copyRoot + `\n--${ntc.name(hexadecimal).toLowerCase().replace(/\s+/g, "_")}: ${hexadecimal};`;
			}
		}
		copyRoot = copyRoot + `\n}`;

		copyRootBtn.addEventListener("click", () => {
			let tempInput = document.createElement("input");
			tempInput.value = copyRoot;
			document.body.appendChild(tempInput);
			tempInput.select();
			document.execCommand("copy");
			document.body.removeChild(tempInput);
		});
		copyRootBtn.disabled = false;
		loader.style.display = "none";
		// git add
	};

	const getContrastColor = (r, g, b) => {
		// Calcula el contraste utilizando la fórmula de luminosidad relativa
		let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

		// Devuelve blanco si el contraste es menor o igual a 0.5 (color oscuro),
		// si no, devuelve negro (color claro)
		return luminance <= 0.5 ? "#ffffff" : "#000000";
	};

	//calcular la distancia euclídea entre 2 puntos p1 y p2
	const euclideanDistance = (p1, p2) => {
		let sum = 0;
		for (let i = 0; i < p1.length; i++) {
			sum += Math.pow(p2[i] - p1[i], 2);
		}
		return Math.sqrt(sum);
	};
	//funciones auxiliares para la inicialización del k-medias
	//escoge aleatoriamente una cantidad qty de pixeles para que actúen como centroides iniciales
	const randomInit = (pixelArray) => {
		let centroids = [];
		for (let i = 0; i < qty; i++) {
			centroids.push(pixelArray[randomIntBetween(0, pixelArray.length)]);
		}
		return centroids;
	};

	//asignar los datos a su cluster
	const clusterDataPoints = (data, centroids) => {
		let clusters = new Array(centroids.length).fill().map(() => []); // Initialize clusters

		data.forEach((point) => {
			let minDistance = Infinity;
			let nearestCentroidIndex = 0;

			// Find the nearest centroid to the point
			for (let i = 0; i < centroids.length; i++) {
				let distance = euclideanDistance(point, centroids[i]);
				if (distance < minDistance) {
					minDistance = distance;
					nearestCentroidIndex = i;
				}
			}

			// Push the point to the cluster of the nearest centroid
			clusters[nearestCentroidIndex].push(point);
		});

		return clusters;
	};

	//calcular punto medio
	const meanPoint = (points) => {
		if (points.length === 0) return [];
		const dimensions = points[0].length;
		const sums = new Array(dimensions).fill(0);

		for (let i = 0; i < points.length; i++) {
			for (let j = 0; j < dimensions; j++) {
				sums[j] += points[i][j];
			}
		}

		const means = sums.map((sum) => sum / points.length);
		return means;
	};

	//actualizar
	const updateCentroids = (clusters) => {
		let centroids = [];
		clusters.forEach((cluster) => {
			centroids.push(meanPoint(cluster));
		});
		return centroids;
	};

	const kMeans = (data, k, maxIterations = 100) => {
		let centroids = randomInit(data, k);
		if (!centroids) {
			console.error("No se pudieron inicializar los centroides");
			return null;
		}

		let iterations = 0;
		let prevCentroids = null;
		let converged = false;

		while (!converged && iterations < maxIterations) {
			let clusters = clusterDataPoints(data, centroids);
			let newCentroids = updateCentroids(clusters);

			// Verificar la convergencia
			converged = true;
			for (let i = 0; i < centroids.length; i++) {
				if (!arraysEqual(centroids[i], newCentroids[i])) {
					converged = false;
					break;
				}
			}

			centroids = newCentroids;
			iterations++;
		}

		return { centroids, iterations };
	};

	const arraysEqual = (arr1, arr2) => {
		if (arr1.length !== arr2.length) return false;
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}
		return true;
	};
};
